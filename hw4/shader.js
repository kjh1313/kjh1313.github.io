// 버텍스 셰이더: 정점의 위치를 계산합니다.
export const VSHADER_SOURCE = `
    attribute vec4 a_Position; // 정점 위치 속성
    uniform mat4 u_ModelMatrix;  // 모델 변환 행렬
    void main() {
        gl_Position = u_ModelMatrix * a_Position;
    }`;

// 프래그먼트 셰이더: 픽셀의 색상을 계산합니다.
export const FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor; // 픽셀 색상 유니폼
    void main() {
        gl_FragColor = u_FragColor;
    }`;