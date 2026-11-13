import { htmlToMarkdown, markupToMarkdown } from "./htmlToMarkdown";

describe("htmlToMarkdown", () => {
  it("converts headings (pushed below the document title), paragraphs and emphasis", () => {
    const markdown = htmlToMarkdown(
      "<h1>Intro</h1><p>Some <strong>bold</strong> and <em>italic</em> text.</p><h3>Deep</h3>",
    );
    expect(markdown).toBe("## Intro\n\nSome **bold** and *italic* text.\n\n### Deep");
  });

  it("makes site-relative links and images absolute", () => {
    const markdown = htmlToMarkdown(
      '<p><a href="/about">About me</a> <img src="/images/a.png" alt="A photo"></p>',
    );
    expect(markdown).toBe(
      "[About me](https://tsyvinda.com/about) ![A photo](https://tsyvinda.com/images/a.png)",
    );
  });

  it("converts lists", () => {
    expect(htmlToMarkdown("<ul><li>One</li><li><p>Two</p></li></ul>")).toBe("- One\n- Two");
    expect(htmlToMarkdown("<ol><li>First</li><li>Second</li></ol>")).toBe("1. First\n1. Second");
  });

  it("keeps code verbatim, entities included", () => {
    const markdown = htmlToMarkdown(
      '<p>Run <code>npm i</code></p><pre><code class="language-ts">const a = 1 &lt; 2;\n  <b>x</b>\n</code></pre>',
    );
    expect(markdown).toBe("Run `npm i`\n\n```ts\nconst a = 1 < 2;\n  x\n```");
  });

  it("quotes blockquotes line by line", () => {
    expect(htmlToMarkdown("<blockquote><p>One</p><p>Two</p></blockquote>")).toBe(
      "> One\n>\n> Two",
    );
  });

  it("renders tables with a header row", () => {
    const markdown = htmlToMarkdown(
      "<table><tr><th>Name</th><th>Use</th></tr><tr><td>a|b</td><td>c</td></tr></table>",
    );
    expect(markdown).toBe("| Name | Use |\n| --- | --- |\n| a\\|b | c |");
  });

  it("decodes entities and drops scripts", () => {
    expect(htmlToMarkdown("<p>A &amp; B&nbsp;&#8212; C</p><script>alert(1)</script>")).toBe(
      "A & B — C",
    );
  });
});

describe("markupToMarkdown", () => {
  it("keeps bold, flattens accent and line breaks", () => {
    expect(markupToMarkdown("Hi, <accent>I build</accent><br>for <strong>web</strong>")).toBe(
      "Hi, I build for **web**",
    );
  });
});
