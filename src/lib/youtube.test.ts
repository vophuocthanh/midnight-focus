import { test } from "node:test";
import assert from "node:assert/strict";
import { parseYouTubeId } from "./youtube";

test("accepts common YouTube link formats", () => {
  assert.equal(parseYouTubeId("https://www.youtube.com/watch?v=jfKfPfyJRdk"), "jfKfPfyJRdk");
  assert.equal(parseYouTubeId("https://youtu.be/jfKfPfyJRdk?si=abc"), "jfKfPfyJRdk");
  assert.equal(parseYouTubeId("https://m.youtube.com/watch?v=jfKfPfyJRdk&t=30s"), "jfKfPfyJRdk");
  assert.equal(parseYouTubeId("https://www.youtube.com/shorts/jfKfPfyJRdk"), "jfKfPfyJRdk");
  assert.equal(parseYouTubeId("https://www.youtube.com/embed/jfKfPfyJRdk"), "jfKfPfyJRdk");
});

test("rejects anything that is not a single video link", () => {
  assert.equal(parseYouTubeId(""), null);
  assert.equal(parseYouTubeId("not a url"), null);
  assert.equal(parseYouTubeId("https://example.com/watch?v=jfKfPfyJRdk"), null);
  assert.equal(parseYouTubeId("https://www.youtube.com/"), null);
  assert.equal(parseYouTubeId("https://www.youtube.com/watch?v=short"), null);
  assert.equal(parseYouTubeId("https://www.youtube.com/watch?v=<script>x"), null);
});
