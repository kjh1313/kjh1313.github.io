// 3색 축 (x=빨강, y=초록, z=파랑)
export class Axes {
  constructor(gl) {
    this.gl = gl;
    this.initBuffer();
  }

  initBuffer() {
    const gl = this.gl;

    const vertices = new Float32Array([
      -2, 0, 0, 2, 0, 0, // X축
      0, -2, 0, 0, 2, 0, // Y축
      0, 0, -2, 0, 0, 2, // Z축
    ]);

    const colors = new Float32Array([
      1, 0, 0, 1, 0, 0, // red
      0, 1, 0, 0, 1, 0, // green
      0, 0, 1, 0, 0, 1, // blue
    ]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  }

  draw(viewMatrix, projMatrix) {
    const gl = this.gl;
    const vsSource = `#version 300 es
      precision highp float;
      layout(location=0) in vec3 a_position;
      layout(location=1) in vec3 a_color;
      uniform mat4 u_view;
      uniform mat4 u_projection;
      out vec3 v_color;
      void main() {
        gl_Position = u_projection * u_view * vec4(a_position, 1.0);
        v_color = a_color;
      }`;
    const fsSource = `#version 300 es
      precision highp float;
      in vec3 v_color;
      out vec4 fragColor;
      void main() { fragColor = vec4(v_color, 1.0); }`;

    const program = this._makeProgram(gl, vsSource, fsSource);
    gl.useProgram(program);

    const uView = gl.getUniformLocation(program, 'u_view');
    const uProj = gl.getUniformLocation(program, 'u_projection');
    gl.uniformMatrix4fv(uView, false, viewMatrix);
    gl.uniformMatrix4fv(uProj, false, projMatrix);

    const aPos = 0, aCol = 1;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aCol);

    gl.drawArrays(gl.LINES, 0, 6);
  }

  _makeProgram(gl, vs, fs) {
    const v = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(v, vs);
    gl.compileShader(v);
    const f = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(f, fs);
    gl.compileShader(f);
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    return p;
  }
}
