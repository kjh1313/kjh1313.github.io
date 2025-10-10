export class SquarePyramid {
  constructor(gl) {
    this.gl = gl;
    this.initBuffer();
  }

  initBuffer() {
    const gl = this.gl;
    const h = 1.0;
    const b = 0.5;

    // 🎨 각 면 색상 정의
    const red    = [1.0, 0.2, 0.2]; // 1
    const mint   = [0.4, 1.0, 1.0]; // 2
    const pink   = [1.0, 0.4, 0.8]; // 3
    const yellow = [1.0, 1.0, 0.0]; // 4

    // ⚙️ red → mint → pink → yellow 순서로 나열
    const vertexData = [
      // side 1 (pink)
      -b, 0, -b,  ...pink,
       b, 0, -b,  ...pink,
       0,  h,  0, ...pink,

      // side 2 (yellow)
       b, 0, -b,  ...yellow,
       b, 0,  b,  ...yellow,
       0,  h,  0, ...yellow,

      // side 3 (red)
       b, 0,  b,  ...red,
      -b, 0,  b,  ...red,
       0,  h,  0, ...red,

      // side 4 (mint)
      -b, 0,  b,  ...mint,
      -b, 0, -b,  ...mint,
       0,  h,  0, ...mint,
    ];

    const vertices = new Float32Array(vertexData);
    const stride = 6 * Float32Array.BYTES_PER_ELEMENT;

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.vertexCount = vertexData.length / 6;
  }

  draw(shader) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

    const aPos = gl.getAttribLocation(shader, 'a_position');
    const aCol = gl.getAttribLocation(shader, 'a_color');

    const stride = 6 * Float32Array.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(aPos);

    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aCol);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
  }
}
