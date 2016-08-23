import $ from "jquery";
export default function(selector,callback) {
	var fn = function(event){
		event.preventDefault();
		$("#drop-add").addClass("show");
		if(event.type == "drop" && event.originalEvent.dataTransfer.files.length)
		{
			callback(event, event.originalEvent.dataTransfer.files);
			$("#drop-add").removeClass("show");
		}
		if( event.type == "dragleave")
		{
			$("#drop-add").removeClass("show");
		}
	};
	$(selector).on("dragenter", null, fn);
	$(selector).on("dragover", null, fn);
	$(selector).on("drop", null, fn);
	$(selector).on("dragleave", null, fn);
}