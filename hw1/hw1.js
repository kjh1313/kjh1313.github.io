function main() {
  const canvas = document.getElementById("glcanvas");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    alert("WebGL not supported!");
    return;
  }

  // Scissor Test 켜기
  gl.enable(gl.SCISSOR_TEST);

  // 리사이즈 이벤트 처리 → 정사각형 유지 + 다시 그리기
  window.addEventListener("resize", () => {
    resizeCanvas(gl, canvas);
    drawScene(gl);
  });

  // 초기 실행
  resizeCanvas(gl, canvas);
  drawScene(gl);
}

function resizeCanvas(gl, canvas) {
  // 캔버스를 윈도우 크기에 맞춤
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // 정사각형 크기 계산
  const size = Math.min(canvas.width, canvas.height);

  // viewport를 정사각형 크기로 설정
  gl.viewport(0, 0, size, size);

  // 캔버스 객체에 size 저장 (다시 사용하려고)
  gl.canvasSize = size;
}

function drawScene(gl) {
  const size = gl.canvasSize;
  const half = size / 2;

  // 1. 좌측 상단 (초록)
  gl.scissor(0, half, half, half);
  gl.clearColor(0.0, 1.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 2. 우측 상단 (빨강)
  gl.scissor(half, half, half, half);
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 3. 좌측 하단 (파랑)
  gl.scissor(0, 0, half, half);
  gl.clearColor(0.0, 0.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 4. 우측 하단 (노랑)
  gl.scissor(half, 0, half, half);
  gl.clearColor(1.0, 1.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

main();
