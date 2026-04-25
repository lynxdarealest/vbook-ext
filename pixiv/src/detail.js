load("pixiv.js");

function execute(url) {
    var seriesId = parseSeriesId(url);
    if (seriesId) {
        var series = getSeriesDetailById(seriesId);
        if (!series) return null;

        var tagItems = [];
        (series.tags || []).forEach(function (tag) {
            tagItems.push(buildTagItem(tag));
        });

        return Response.success({
            name: series.title || "",
            cover: coverFromSeries(series),
            host: BASE_URL,
            author: series.userName || "",
            description: series.caption || "",
            detail: joinText([
                series.language,
                series.displaySeriesContentCount ? ("Chapters " + series.displaySeriesContentCount) : "",
                formatDate(series.updateDate),
                series.watchCount ? ("Watchers " + series.watchCount) : ""
            ]),
            ongoing: !series.isConcluded,
            genres: tagItems
        });
    }

    var novelId = parseNovelId(url);
    if (!novelId) return null;
    var detail = getNovelDetailById(novelId);
    if (!detail) return null;

    var tags = [];
    if (detail.tags && detail.tags.tags) {
        detail.tags.tags.forEach(function (tag) {
            tags.push(buildTagItem(tag.tag));
        });
    }

    var ongoing = false;
    if (detail.seriesNavData) {
        ongoing = !detail.seriesNavData.isConcluded;
    }

    return Response.success({
        name: detail.title || "",
        cover: detail.coverUrl || "",
        host: BASE_URL,
        author: detail.userName || "",
        description: detail.description || "",
        detail: joinText([
            detail.language,
            detail.wordCount ? ("Words " + detail.wordCount) : "",
            formatDate(detail.createDate),
            detail.seriesNavData ? detail.seriesNavData.title : ""
        ]),
        ongoing: ongoing,
        genres: tags
    });
}
