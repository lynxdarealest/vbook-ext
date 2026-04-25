function execute() {
    return Response.success([
        { title: "中文", input: encodeURIComponent("中文"), script: "gen.js" },
        { title: "百合", input: encodeURIComponent("百合"), script: "gen.js" },
        { title: "恋愛", input: encodeURIComponent("恋愛"), script: "gen.js" },
        { title: "ファンタジー", input: encodeURIComponent("ファンタジー"), script: "gen.js" }
    ]);
}
