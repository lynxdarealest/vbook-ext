load("pixiv.js");

function execute(url) {
    var seriesId = parseSeriesId(url);
    if (seriesId) {
        var series = getSeriesDetailById(seriesId);
        if (!series) return null;
        var recommendations = getAuthorNovelRecommendations(series.userId, series.userName, {
            excludeSeriesId: seriesId,
            limit: 3
        });

        return Response.success({
            name: series.title || "",
            cover: coverFromSeries(series),
            host: BASE_URL,
            author: series.userName || "",
            description: buildAuthorRecommendationDescription(recommendations),
            detail: joinText([
                formatWordCount(series.wordCount || series.totalWordCount),
                formatUpdatedDate(series.updateDate),
                formatChapterCount(series.displaySeriesContentCount || series.total)
            ]),
            ongoing: !series.isConcluded,
            genres: []
        });
    }

    var novelId = parseNovelId(url);
    if (!novelId) return null;
    var detail = getNovelDetailById(novelId);
    if (!detail) return null;
    var seriesDetail = null;
    if (detail.seriesNavData && detail.seriesNavData.seriesId) {
        seriesDetail = getSeriesDetailById(String(detail.seriesNavData.seriesId));
    }

    var ongoing = false;
    if (detail.seriesNavData) {
        ongoing = !detail.seriesNavData.isConcluded;
    }
    var recommendations = getAuthorNovelRecommendations(detail.userId, detail.userName, {
        excludeNovelId: novelId,
        excludeSeriesId: detail.seriesNavData ? detail.seriesNavData.seriesId : "",
        limit: 3
    });

    return Response.success({
        name: detail.title || "",
        cover: detail.coverUrl || "",
        host: BASE_URL,
        author: detail.userName || "",
        description: buildAuthorRecommendationDescription(recommendations),
        detail: joinText([
            formatWordCount(detail.wordCount),
            formatUpdatedDate((seriesDetail && seriesDetail.updateDate) || detail.updateDate || detail.createDate),
            formatChapterCount((seriesDetail && (seriesDetail.displaySeriesContentCount || seriesDetail.total)) || 1)
        ]),
        ongoing: ongoing,
        genres: []
    });
}
