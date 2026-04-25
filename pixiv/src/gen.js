load("pixiv.js");

function execute(input, page) {
    if (!page) page = "1";
    var url = BASE_URL
        + "/ajax/search/novels/" + input
        + "?word=" + input
        + "&order=date_d&mode=all&p=" + page
        + "&s_mode=s_tag_full&lang=en";
    var body = fetchJson(url, BASE_URL + "/tags/" + input + "/novels");
    if (!body || !body.novel || !body.novel.data) return null;

    var data = [];
    body.novel.data.forEach(function (item) {
        data.push({
            name: item.title || "",
            link: BASE_URL + "/novel/show.php?id=" + item.id,
            description: item.userName || "",
            cover: item.url || "",
            host: BASE_URL
        });
    });

    var nextPage = null;
    var currentPage = parseInt(page, 10) || 1;
    if (body.novel.lastPage && currentPage < body.novel.lastPage) {
        nextPage = String(currentPage + 1);
    }

    return Response.success(data, nextPage);
}
