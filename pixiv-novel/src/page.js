load("pixiv.js");

function execute(url) {
    var seriesId = parseSeriesId(url);
    if (!seriesId) {
        var novelId = parseNovelId(url);
        if (!novelId) return Response.success([]);
        var detail = getNovelDetailById(novelId);
        if (detail && detail.seriesNavData && detail.seriesNavData.seriesId) {
            seriesId = String(detail.seriesNavData.seriesId);
        } else {
            return Response.success(["pixiv-novel:" + novelId]);
        }
    }

    var series = getSeriesDetailById(seriesId);
    if (!series) return Response.success([]);

    var total = parseInt(series.displaySeriesContentCount || series.total || "0", 10);
    if (!total || total < 1) return Response.success(["pixiv-series:" + seriesId + ":0"]);

    var pages = [];
    for (var offset = 0; offset < total; offset += SERIES_PAGE_SIZE) {
        pages.push("pixiv-series:" + seriesId + ":" + offset);
    }
    return Response.success(pages);
}
