export default `

uniform float u_time;
uniform vec2 u_freq;

varying vec2 v_uv;

void main(){
    vec4 modelPos = modelMatrix * vec4(position, 1.0);
    vec4 viewPos = viewMatrix * modelPos;
    vec4 projectedPos = projectionMatrix *viewPos;
    gl_Position = projectedPos;
    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    v_uv=uv;
}`