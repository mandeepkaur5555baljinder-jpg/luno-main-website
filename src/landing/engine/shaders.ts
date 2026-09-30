/** GLSL for the particle field (WebGL2 / GLSL ES 3.00). */

export const POINTS_VERT = /* glsl */ `#version 300 es
precision highp float;

in vec4 aS0; in vec4 aS1; in vec4 aS2; in vec4 aS3; in vec4 aS4; in vec4 aS5; in vec4 aS6; in vec4 aS7; in vec4 aS8; in vec4 aS9;
in vec4 aSeed;  // x delay, y tone, z size random, w phase
in vec3 aMeta;  // x cluster, y ribbon, z stream coordinate

uniform mat4 uViewProj;
uniform mat4 uModel;
uniform float uFrom;
uniform float uTo;
uniform float uF;
uniform float uSpread;
uniform float uSwirl;
uniform float uTime;
uniform float uBreath;
uniform vec2  uPointer;
uniform vec2  uParallax;
uniform float uDof;
uniform float uPointerAmt;
uniform float uPulse;
uniform float uFlow;
uniform float uActive;
uniform float uActiveKind;
uniform float uActiveAmt;
uniform float uSize;
uniform float uPx;
uniform float uMaxPx;
uniform float uDim;
uniform float uMood;
uniform float uAssemble;

out vec4 vCol;
out float vSoft;

vec4 pick(float k) {
  if (k < 0.5) return aS0;
  if (k < 1.5) return aS1;
  if (k < 2.5) return aS2;
  if (k < 3.5) return aS3;
  if (k < 4.5) return aS4;
  if (k < 5.5) return aS5;
  if (k < 6.5) return aS6;
  if (k < 7.5) return aS7;
  if (k < 8.5) return aS8;
  return aS9;
}

void main() {
  float delay = aSeed.x;
  float g = smoothstep(0.0, 1.0, clamp((uF - delay * uSpread) / (1.0 - uSpread), 0.0, 1.0));
  vec4 a = pick(uFrom);
  vec4 b = pick(uTo);
  vec3 p = mix(a.xyz, b.xyz, g);
  float br = mix(a.w, b.w, g);

  // Boot: the swarm gathers from the diffuse cloud into whatever shape is current.
  float ga = smoothstep(0.0, 1.0, clamp((uAssemble - delay * 0.45) / 0.55, 0.0, 1.0));
  p = mix(aS1.xyz * 1.55, p, ga);
  br *= mix(0.15, 1.0, ga);

  // Transition: a coherent vortex + gentle radial swell, strongest mid-morph.
  float e = sin(3.14159265 * g);
  float ang = e * uSwirl * (0.45 + aSeed.z * 0.9);
  float cs = cos(ang), sn = sin(ang);
  p.xz = vec2(cs * p.x - sn * p.z, sn * p.x + cs * p.z);
  p *= 1.0 + e * uSwirl * 0.16 * aSeed.z;

  // Idle breathing (one shared phase + tiny per-particle offset).
  p *= 1.0 + uBreath * (0.010 * sin(uTime * 0.7 + aSeed.w * 6.2831) + 0.012 * sin(uTime * 0.45));

  // Thinking ripple.
  float len = length(p) + 1e-4;
  p += (p / len) * uPulse * 0.055 * sin(len * 7.0 - uTime * 3.4 + aSeed.w * 2.0);

  vec4 world = uModel * vec4(p, 1.0);

  // Pointer gravity: a soft pull toward the cursor.
  vec2 d = world.xy - uPointer;
  float fall = exp(-dot(d, d) * 1.5) * uPointerAmt;
  world.xy -= d * fall * 0.26;
  world.z += fall * 0.3 * (aSeed.z - 0.35);
  // Depth parallax: near points travel with the cursor, far points against it.
  world.xy += uParallax * world.z * 0.5;

  vec4 clip = uViewProj * world;
  gl_Position = clip;

  // Highlight the active mode cluster / stream, quiet the rest.
  float id = uActiveKind < 0.5 ? aMeta.x : aMeta.y;
  float isActive = 1.0 - step(0.5, abs(id - uActive));
  float boost = 1.0 + uActiveAmt * (isActive * 1.25 - (1.0 - isActive) * 0.5);

  // Light travelling along the streams.
  float wave = pow(max(0.0, sin(aMeta.z * 15.0 - uTime * 2.1 + aMeta.y * 1.9)), 3.0);
  boost *= 1.0 + uFlow * 1.5 * wave;

  float tw = 1.0 - uBreath * 0.22 * (0.5 + 0.5 * sin(uTime * 1.3 + aSeed.w * 40.0));
  float depth = clamp(1.25 - (clip.w - 7.0) * 0.14, 0.45, 1.25);

  // Cheap depth of field: points away from the focal plane grow soft and dim.
  float soft = clamp(abs(clip.w - 7.0) / 3.2, 0.0, 1.0) * uDof;
  vSoft = soft;
  float size = uSize * (0.55 + aSeed.z * 0.95) * (0.65 + 0.55 * br) * (1.0 + 0.35 * uFlow * wave) * (1.0 + soft * 0.75);
  gl_PointSize = clamp(size * uPx / clip.w, 1.0, uMaxPx);

  // Palette: cyan → electric blue, cool-white highlights, a whisper of violet.
  vec3 cyan   = vec3(0.30, 0.94, 0.88);
  vec3 blue   = vec3(0.24, 0.48, 1.00);
  vec3 white  = vec3(0.90, 0.97, 1.00);
  vec3 violet = vec3(0.56, 0.48, 1.00);
  float tone = aSeed.y;
  float k = smoothstep(0.0, 1.0, clamp(tone * (0.45 + uMood * 1.1), 0.0, 1.0));
  vec3 col = mix(cyan, blue, k * 0.85);
  col = mix(col, white, smoothstep(0.55, 1.0, br) * 0.72);
  col = mix(col, violet, step(0.982, tone) * 0.55);

  float inten = br * uDim * tw * depth * boost * (1.0 - soft * 0.5);
  vCol = vec4(col, inten);
}
`;

export const POINTS_FRAG = /* glsl */ `#version 300 es
precision mediump float;
in vec4 vCol;
in float vSoft;
out vec4 o;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float d = dot(q, q) * 4.0;
  if (d > 1.0) discard;
  float a = 1.0 - d;
  a = mix(a * a, a, vSoft);
  o = vec4(vCol.rgb * vCol.a * a, 1.0);
}
`;

export const BG_VERT = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const BG_FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec3 uGlow;   // ndc x, ndc y, intensity
uniform float uMood;
uniform float uDim;
out vec4 o;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 top = vec3(0.012, 0.020, 0.034);
  vec3 bot = vec3(0.002, 0.005, 0.010);
  vec3 col = mix(bot, top, smoothstep(0.0, 1.0, uv.y));

  vec2 q = (uv * 2.0 - 1.0 - uGlow.xy) * vec2(uRes.x / uRes.y, 1.0);
  float d = length(q);
  vec3 gc = mix(vec3(0.02, 0.20, 0.22), vec3(0.04, 0.10, 0.34), uMood);
  col += gc * (exp(-d * d * 1.2) * 1.0 + exp(-d * 0.8) * 0.28) * uGlow.z;

  vec2 v = uv * 2.0 - 1.0;
  col *= 1.0 - 0.38 * dot(v, v) * 0.5;
  col *= mix(1.0, 0.7, 1.0 - uDim);

  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  o = vec4(col, 1.0);
}
`;
