import { resizeAspectRatio, setupText, updateText, Axes } from './util/util.js';
import { Shader, readShaderFile } from './util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

let shader, vao, positionBuffer;
let isInitialized = false;

let circle = null; // [cx, cy, r]
let line = null;   // [x1, y1, x2, y2]
let intersections = [];

let isDrawingCircle = false;
let isDrawingLine = false;
let startPoint = null;
let tempPoint = null;

let textCircle, textLine, textIntersections;
let axes = new Axes(gl, 0.85);

document.addEventListener("DOMContentLoaded", () => {
    if (!isInitialized) {
        main();
        isInitialized = true;
    }
});

function initWebGL() {
    canvas.width = 700;
    canvas.height = 700;
    // resizeAspectRatio(gl, canvas);
    gl.clearColor(0.05, 0.1, 0.15, 1.0);
    return true;
}

async function initShader() {
    const vs = await readShaderFile("shVert.glsl");
    const fs = await readShaderFile("shFrag.glsl");
    shader = new Shader(gl, vs, fs);
}


function setupBuffers() {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    shader.setAttribPointer('a_position', 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
}

function convertToGL(x, y) {
    return [
        (x / canvas.width) * 2 - 1,
        -((y / canvas.height) * 2 - 1)
    ];
}

function getMouseGL(event) {
    const rect = canvas.getBoundingClientRect();
    return convertToGL(event.clientX - rect.left, event.clientY - rect.top);
}

function setupMouseEvents() {
    canvas.addEventListener("mousedown", e => {
        const [gx, gy] = getMouseGL(e);
        if (!circle) {
            startPoint = [gx, gy];
            isDrawingCircle = true;
        } else if (!line) {
            startPoint = [gx, gy];
            isDrawingLine = true;
        }
    });

    canvas.addEventListener("mousemove", e => {
        if (isDrawingCircle || isDrawingLine) {
            tempPoint = getMouseGL(e);
            render();
        }
    });

    canvas.addEventListener("mouseup", () => {
        if (isDrawingCircle && tempPoint) {
            const r = Math.hypot(tempPoint[0] - startPoint[0], tempPoint[1] - startPoint[1]);
            circle = [...startPoint, r];
            updateText(textCircle, `Circle: center (${circle[0].toFixed(2)}, ${circle[1].toFixed(2)}) radius = ${circle[2].toFixed(2)}`);
            isDrawingCircle = false;
            tempPoint = null;
            render();
        } else if (isDrawingLine && tempPoint) {
            line = [...startPoint, ...tempPoint];
            updateText(textLine, `Line segment: (${line[0].toFixed(2)}, ${line[1].toFixed(2)}) ~ (${line[2].toFixed(2)}, ${line[3].toFixed(2)})`);
            isDrawingLine = false;
            tempPoint = null;
            computeIntersections();
            render();
        }
    });
}

function computeIntersections() {
    intersections = [];
    if (!circle || !line) return;
    const [cx, cy, r] = circle;
    const [x1, y1, x2, y2] = line;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const a = dx * dx + dy * dy;
    const b = 2 * (dx * (x1 - cx) + dy * (y1 - cy));
    const c = (x1 - cx) ** 2 + (y1 - cy) ** 2 - r * r;

    const disc = b * b - 4 * a * c;
    if (disc < 0) {
        updateText(textIntersections, "Intersection Points: None");
        return;
    }

    const sqrtD = Math.sqrt(disc);
    const t1 = (-b + sqrtD) / (2 * a);
    const t2 = (-b - sqrtD) / (2 * a);
    [t1, t2].forEach(t => {
        if (t >= 0 && t <= 1) intersections.push([x1 + t * dx, y1 + t * dy]);
    });

    if (intersections.length > 0) {
        updateText(textIntersections,
            `Intersection Points: ${intersections.length} ` +
            intersections.map((p, i) => `Point ${i+1}: (${p[0].toFixed(2)}, ${p[1].toFixed(2)})`).join(" ")
        );
    } else {
        updateText(textIntersections, "Intersection Points: None (segment outside circle)");
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.use();
    gl.bindVertexArray(vao);

    if (circle) drawCircle(circle[0], circle[1], circle[2], [1.0, 0.0, 1.0, 1.0]);
    else if (isDrawingCircle && tempPoint) {
        const r = Math.hypot(tempPoint[0] - startPoint[0], tempPoint[1] - startPoint[1]);
        drawCircle(startPoint[0], startPoint[1], r, [0.5, 0.5, 0.5, 1.0]);
    }

    if (line) drawLine(line, [0.7, 0.7, 0.7, 1.0]);
    else if (isDrawingLine && tempPoint) drawLine([...startPoint, ...tempPoint], [0.5, 0.5, 0.5, 1.0]);

    intersections.forEach(p => drawPoint(p, [1.0, 1.0, 0.0, 1.0]));
    axes.draw(mat4.create(), mat4.create());
}

function drawCircle(cx, cy, r, color) {
    const segments = 100;
    let vertices = [];
    for (let i = 0; i <= segments; i++) {
        const theta = (2 * Math.PI * i) / segments;
        vertices.push(cx + r * Math.cos(theta), cy + r * Math.sin(theta));
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    shader.setVec4("u_color", color);
    gl.drawArrays(gl.LINE_STRIP, 0, segments + 1);
}

function drawLine(coords, color) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
    shader.setVec4("u_color", color);
    gl.drawArrays(gl.LINES, 0, 2);
}

function drawPoint(p, color) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(p), gl.STATIC_DRAW);
    shader.setVec4("u_color", color);
    shader.setFloat("u_pointSize", 10.0);
    gl.drawArrays(gl.POINTS, 0, 1);
}

async function main() {
    if (!initWebGL()) return;
    await initShader();
    setupBuffers();
    shader.use();
    textCircle = setupText(canvas, "Draw a circle by dragging", 1);
    textLine = setupText(canvas, "Then draw a line segment", 2);
    textIntersections = setupText(canvas, "Intersection info", 3);
    setupMouseEvents();
    render();
}
