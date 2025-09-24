let gl, program;
let translation = [0.0, 0.0];
const step = 0.01;
const halfSize = 0.1; // 정사각형 한 변 = 0.2

// 키 상태 저장
const keyState = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

async function main() {
  const canvas = document.getElementById("glCanvas");
  gl = canvas.getContext("webgl");
  if (!gl) {
    alert("WebGL not supported");
    return;
  }

  program = await initShaders(gl);
  gl.useProgram(program);

  const vertices = new Float32Array([
    -halfSize, -halfSize,
     halfSize, -halfSize,
     halfSize,  halfSize,
    -halfSize,  halfSize
  ]);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // 키 이벤트 등록
  window.addEventListener("keydown", (event) => {
    if (event.key in keyState) keyState[event.key] = true;
  });
  window.addEventListener("keyup", (event) => {
    if (event.key in keyState) keyState[event.key] = false;
  });

  window.addEventListener("resize", resizeAspectRatio);

  resizeAspectRatio();
  requestAnimationFrame(update);
}

function update() {
  if (keyState.ArrowUp && translation[1] + step <= 1 - halfSize)
    translation[1] += step;
  if (keyState.ArrowDown && translation[1] - step >= -1 + halfSize)
    translation[1] -= step;
  if (keyState.ArrowLeft && translation[0] - step >= -1 + halfSize)
    translation[0] -= step;
  if (keyState.ArrowRight && translation[0] + step <= 1 - halfSize)
    translation[0] += step;

  drawScene();
  requestAnimationFrame(update);
}

function drawScene() {
  // WebGL 렌더링
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const uTranslation = gl.getUniformLocation(program, "uTranslation");
  gl.uniform2fv(uTranslation, translation);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  // === 텍스트는 별도의 2D 캔버스에 그리기 ===
  const textCanvas = document.getElementById("textCanvas");
  const ctx2d = textCanvas.getContext("2d");
  ctx2d.clearRect(0, 0, textCanvas.width, textCanvas.height);
  ctx2d.font = "13px sans-serif";
  ctx2d.fillStyle = "white";
  ctx2d.textAlign = "left";   // 왼쪽 정렬
  ctx2d.textBaseline = "top";
  ctx2d.fillText("Use arrow keys to move the rectangle", 10, 10);
}


function resizeAspectRatio() {
  const canvas = gl.canvas;
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
  canvas.width = canvas.height = size;
  gl.viewport(0, 0, canvas.width, canvas.height);
}

window.onload = main;
