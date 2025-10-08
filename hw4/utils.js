/**
 * WebGL 렌더링 컨텍스트를 가져오는 함수
 */
export function initWebGL(canvas) {
    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error("WebGL을 지원하지 않는 브라우저입니다.");
        return null;
    }
    return gl;
}

/**
 * 셰이더를 컴파일하고 링크하여 프로그램을 생성하는 함수
 */
export function initShaders(gl, vshader, fshader) {
    const program = createProgram(gl, vshader, fshader);
    if (!program) {
        console.error('셰이더 프로그램 생성 실패');
        return null;
    }
    gl.useProgram(program);
    return program;
}

function createProgram(gl, vshader, fshader) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('프로그램 링크 실패: ' + gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        return null;
    }
    return program;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error((type === gl.VERTEX_SHADER ? '버텍스' : '프래그먼트') + ' 셰이더 컴파일 실패: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

/**
 * 4x4 행렬 연산을 위한 간단한 유틸리티 객체
 */
export const Matrix4 = {
    identity: () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],

    translate: (mat, tx, ty, tz) => {
        const [m00,m01,m02,m03, m10,m11,m12,m13, m20,m21,m22,m23, m30,m31,m32,m33] = mat;
        mat[12] = m00*tx + m10*ty + m20*tz + m30;
        mat[13] = m01*tx + m11*ty + m21*tz + m31;
        mat[14] = m02*tx + m12*ty + m22*tz + m32;
        mat[15] = m03*tx + m13*ty + m23*tz + m33;
        return mat;
    },

    rotate: (mat, rad, x, y, z) => {
        let len = Math.sqrt(x*x + y*y + z*z);
        if (len < 1e-6) return mat;
        len = 1/len; x*=len; y*=len; z*=len;
        const s = Math.sin(rad), c = Math.cos(rad), t = 1 - c;
        const [a00,a01,a02,a03, a10,a11,a12,a13, a20,a21,a22,a23] = mat;
        const b00=x*x*t+c, b01=y*x*t+z*s, b02=z*x*t-y*s;
        const b10=x*y*t-z*s, b11=y*y*t+c,   b12=z*y*t+x*s;
        const b20=x*z*t+y*s, b21=y*z*t-x*s, b22=z*z*t+c;
        mat[0]=a00*b00+a10*b01+a20*b02; mat[1]=a01*b00+a11*b01+a21*b02; mat[2]=a02*b00+a12*b01+a22*b02; mat[3]=a03*b00+a13*b01+a23*b02;
        mat[4]=a00*b10+a10*b11+a20*b12; mat[5]=a01*b10+a11*b11+a21*b12; mat[6]=a02*b10+a12*b11+a22*b12; mat[7]=a03*b10+a13*b11+a23*b12;
        mat[8]=a00*b20+a10*b21+a20*b22; mat[9]=a01*b20+a11*b21+a21*b22; mat[10]=a02*b20+a12*b21+a22*b22; mat[11]=a03*b20+a13*b21+a23*b22;
        return mat;
    },

    scale: (mat, sx, sy, sz) => {
        mat[0]*=sx; mat[1]*=sx; mat[2]*=sx; mat[3]*=sx;
        mat[4]*=sy; mat[5]*=sy; mat[6]*=sy; mat[7]*=sy;
        mat[8]*=sz; mat[9]*=sz; mat[10]*=sz; mat[11]*=sz;
        return mat;
    }
};