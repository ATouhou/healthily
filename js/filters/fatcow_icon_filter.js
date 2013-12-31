app.filter('fatcow_icon', function(){
    return function(filename, size){
        if (!size) size = '16';
        else size = size.toString();
        size = size + 'x' + size;
        return 'icons/FatCow_Icons'+ size + '/' + filename + '.png';
    }
});