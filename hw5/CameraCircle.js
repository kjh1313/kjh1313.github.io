import { mat4, vec3, glMatrix } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js';
import { SquarePyramid } from './squarePyramid.js';
import { Axes } from './axes.js'; // 축 표시용

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader, startTime;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();

const radius = 3.0;
const orbitSpeed = 90.0;
const ySpeed = 45.0;
const yAmplitude = 1.0;

document.addEventListener('DOMContentLoaded', main);

async function main() {
  if (!gl) {
    alert('WebGL 2 not supported!');
    return;
  }

  canvas.width = 700;
  canvas.height = 700;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.12, 0.18, 0.25, 1.0); // 배경: 진한 남색톤
  gl.enable(gl.DEPTH_TEST);

  const vs = await fetch('./shVert.glsl').then(r => r.text());
  const fs = await fetch('./shFrag.glsl').then(r => r.text());
  shader = createProgram(gl, vs, fs);

  const pyramid = new SquarePyramid(gl);
  const axes = new Axes(gl);

  mat4.perspective(
    projMatrix,
    glMatrix.toRadian(60),
    canvas.width / canvas.height,
    0.1,
    100.0
  );

  startTime = Date.now();

  function render() {
    const time = (Date.now() - startTime) / 1000.0;

    // 🔹 각속도 (deg/sec → rad/sec)
    const angleXZ = glMatrix.toRadian(orbitSpeed * time); // 90 deg/sec
    const angleY  = glMatrix.toRadian(ySpeed * time);     // 45 deg/sec

    // 🔹 xz-plane 원운동 (반지름 3)
    const camX = radius * Math.sin(angleXZ);
    const camZ = radius * Math.cos(angleXZ);

    // 🔹 y는 0~10 범위로 반복 (중심 5, 진폭 5)
    const camY = 5.0 + 5.0 * Math.sin(angleY);

    // 🔹 카메라 view 설정 (항상 원점 바라봄)
    mat4.lookAt(
        viewMatrix,
        vec3.fromValues(camX, camY, camZ),
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 1, 0)
    );

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(shader);
    const uModel = gl.getUniformLocation(shader, 'u_model');
    const uView = gl.getUniformLocation(shader, 'u_view');
    const uProj = gl.getUniformLocation(shader, 'u_projection');
    gl.uniformMatrix4fv(uModel, false, modelMatrix);
    gl.uniformMatrix4fv(uView, false, viewMatrix);
    gl.uniformMatrix4fv(uProj, false, projMatrix);

    pyramid.draw(shader);
    axes.draw(viewMatrix, projMatrix);

    requestAnimationFrame(render);
    }

  render();
}

function createProgram(gl, vsSource, fsSource) {
  function loadShader(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  const vs = loadShader(gl.VERTEX_SHADER, vsSource);
  const fs = loadShader(gl.FRAGMENT_SHADER, fsSource);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    console.error('Program link error:', gl.getProgramInfoLog(prog));
  return prog;
}
