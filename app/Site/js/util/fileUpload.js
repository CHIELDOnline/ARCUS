function initialiseFileUpload() {

    // The event listener for the file upload
    document.getElementById('txtFileUpload').addEventListener('change', uploadCSV, false);
}
// Method that checks that the browser supports the HTML5 File API
function browserSupportFileUpload() {
    var isCompatible = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    isCompatible = true;
    }
    return isCompatible;
}

// Method that reads and processes the selected file
function uploadCSV(evt) {
    console.log("UPLOAD");
if (!browserSupportFileUpload()) {
    alert('The File APIs are not fully supported in this browser!');
    } else {
        var data = null;
        var file = evt.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(event) {
            var csvData = event.target.result;
            data = $.csv.toArrays(csvData);
            console.log("DATA")
            console.log(data)
            if (data && data.length > 0) {
              csvToGrid(data);
            } 
        };
        reader.onerror = function() {
            alert('Unable to read ' + file.fileName);
        };
    }
}

function csvToGrid(data, headerConversion={"AnalysisType":"Analysis","SampleN":"Sample","StatType":"Stat type"}){
    console.log("CSVTOGRID");
    console.log(data);
    var header = data[0];
    
    // optionally replace some header names in the csv
    // to names that work with the grid
    if(Object.keys(headerConversion).length>0){
    	for(var i=0;i<header.length;++i){
    		if (header[i] in headerConversion){
    			header[i] = headerConversion[header[i]];
    		}
    	}
    }
    var json = []
    for(var i=1;i<data.length;++i){
        var row = {}
        var hasData = false;
        for(var j=0; j<header.length;++j){
            row[header[j]] = data[i][j];
            if(data[i][j].length>0){
                hasData = true;
            }
        }
        if(hasData){
            json.push(row);
        }
    }
    console.log(json);
    $("#jsGrid").jsGrid("option", "data", json);
    redrawGUIfromGrid();

}