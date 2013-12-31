app.service('LocalizationService', function(){

    var sanitizeText = function(text){
        return text.replace(/@\w+/, '');
    }

    var countMatches = function(text, match){
        var matches = text.match(new RegExp(match, 'g'));
        return matches !== null ? matches.length : 0;
    }

    this.isRTL = function(text){
        text = sanitizeText(text);
        var count_arb = countMatches(text, '[\\u060C-\\u06FE\\uFB50-\\uFEFC]');
        return count_arb * 100 / text.length > 20;
    }
});