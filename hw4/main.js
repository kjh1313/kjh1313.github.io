import { VSHADER_SOURCE, FSHADER_SOURCE } from './shader.js';
import { initWebGL, initShaders, Matrix4 } from './utils.js';

function main() {
    const canvas = document.getElementById('gl-canvas');
    const gl = initWebGL(canvas);
    const program = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    const n = initVertexBuffers(gl, program);
    
    const u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
    const u_FragColor = gl.getUniformLocation(program, 'u_FragColor');

    gl.clearColor(0.06, 0.12, 0.24, 1.0);

    const startTime = Date.now();

    const tick = () => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        
        const largeBladeAngle = Math.sin(elapsedTime) * Math.PI * 2.0;
        const smallBladeAngle = Math.sin(elapsedTime) * Math.PI * -10.0;

        gl.clear(gl.COLOR_BUFFER_BIT);
        draw(gl, n, u_ModelMatrix, u_FragColor, largeBladeAngle, smallBladeAngle);
        
        requestAnimationFrame(tick);
    };

    tick();
}

function initVertexBuffers(gl, program) {
    const vertices = new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5]);
    const n = 4;

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    return n;
}

function draw(gl, n, u_ModelMatrix, u_FragColor, largeBladeAngle, smallBladeAngle) {
    let modelMatrix;

    // 1. 갈색 기둥 (중앙 고정)
    modelMatrix = Matrix4.identity();
    Matrix4.scale(modelMatrix, 0.2, 1.0, 1.0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);
    gl.uniform4f(u_FragColor, 139/255, 69/255, 19/255, 1.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

    // --- 기준점 보정값: 날개를 기둥의 윗부분으로 이동 ---
    const pivotY = 0.5; // 기둥의 절반 높이 정도

    // 2. 흰색 큰 날개
    modelMatrix = Matrix4.identity();
    Matrix4.translate(modelMatrix, 0.0, pivotY, 0.0); // 기둥 윗부분으로 이동
    Matrix4.rotate(modelMatrix, largeBladeAngle, 0, 0, 1);
    Matrix4.scale(modelMatrix, 0.6, 0.1, 1.0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

    const largeBladeHalfWidth = 0.3;

    // 3. 왼쪽 작은 날개
    modelMatrix = Matrix4.identity();
    Matrix4.translate(modelMatrix, 0.0, pivotY, 0.0);
    Matrix4.rotate(modelMatrix, largeBladeAngle, 0, 0, 1);
    Matrix4.translate(modelMatrix, -largeBladeHalfWidth, 0.0, 0.0);
    Matrix4.rotate(modelMatrix, smallBladeAngle, 0, 0, 1);
    Matrix4.scale(modelMatrix, 0.15, 0.04, 1.0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);
    gl.uniform4f(u_FragColor, 0.5, 0.5, 0.5, 1.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

    // 4. 오른쪽 작은 날개
    modelMatrix = Matrix4.identity();
    Matrix4.translate(modelMatrix, 0.0, pivotY, 0.0);
    Matrix4.rotate(modelMatrix, largeBladeAngle, 0, 0, 1);
    Matrix4.translate(modelMatrix, largeBladeHalfWidth, 0.0, 0.0);
    Matrix4.rotate(modelMatrix, smallBladeAngle, 0, 0, 1);
    Matrix4.scale(modelMatrix, 0.15, 0.04, 1.0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);
    gl.uniform4f(u_FragColor, 0.5, 0.5, 0.5, 1.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}


main();