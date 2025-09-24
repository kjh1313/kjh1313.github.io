attribute vec2 aPosition;
uniform vec2 uTranslation;

void main() {
    vec2 pos = aPosition + uTranslation;
    gl_Position = vec4(pos, 0.0, 1.0);
}
