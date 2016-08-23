function levenshteinDistance(str1, str2) {
    str1 = str1.toLocaleLowerCase();
    str2 = str2.toLocaleLowerCase();
    function genMatrix(row, column){
        var matrix = [];
        for(var i = 0; i < row; i++)
        {
            var columns = [];
            for( var j = 0; j < column; j++ )
            {
                columns.push(0);
                if( i === 0 )
                    columns[j] = j;//第一行每一列填充0~column
            }
            matrix.push(columns);
            matrix[i][0] = i;//每一行的第一列填充0~row
        }
        return matrix;
    }
    var column = str1.length;
    var row = str2.length;
    var matrix = genMatrix(row+1, column+1);
    if( column === 0 )
        return row;
    if( row === 0 )
        return column;
    for( var i = 1; i <= row; i++ )
    {
        var ch1 = str1[i-1];
        for( var j = 1; j <= column; j++ )
        {
            var ch2 = str2[j-1];
            var temp = 0;
            if( ch1 !== ch2 )
            {
                temp = 1;
            }
            matrix[i][j] = Math.min(matrix[i-1][j] + 1, matrix[i][j-1] + 1, matrix[i-1][j-1] + temp);
        }
    }
    return 1 - (matrix[row][column] / Math.max(row, column));
}
export default levenshteinDistance;