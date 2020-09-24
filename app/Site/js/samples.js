// Documents

//d.citation, d.title, d.pk, 
//	l.SampleN,l.SampleLocation,l.SampleDemographic

dtableConfig =  {
		ordering: true,
        lengthChange: false,
        order: [[ 3, "desc" ]],
        pageLength: 8,
        columns: [
        	{data: null, render: function(data,type,row){
        		return '<a href="document.html?key=' + data[2] +'">'+data[0] + '</a>';
        	}},
        	{ data: 1}, // title
        	{ data: 2,visible:false}, // pk
        	{ data: 3}, // N
        	{ data: 4}, // Location
        	{ data: 5} // Demographic
        	]
 	 	};


$(document).ready(function(){

	$("#header").load("header.html", function(){
		$("#SamplesHREF").addClass("active");
	}); 

	preparePage("documents_table","php/getSamplesForDocs.php");
    requestLinks(php_link);

});