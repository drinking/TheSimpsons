
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function parsellsJSON(json,dict) {

  var text = json['content'].map(function(content) {
    return content["text"];
  }).join(" ")

  return parsePureText(text,dict)
  
}

function parsePureText(text,dict) {

  var arr = text.split(/[\s,.:"!-]+/).map(function(content){
    return content.toLowerCase()
  }).filter(function(content){
    return !isNumeric(content) && dict[content] == undefined
  })

  return Array.from(new Set(arr))

}

function parse(str,dict) {

  try {
    var json = JSON.parse(str)
    return parsellsJSON(json,dict)
  } catch(err){
    console.log("Not a json!")
  }

  return parsePureText(str,dict)

}

function clearHistory(callback) {
  $cache.setAsync({
    key: "history",
    value: new Array(),
    handler: function(object) {
      callback();
    }
  })
}

function printDate() {
	function padStr(i) {
			return (i < 10) ? "0" + i : "" + i;
	}
	var temp = new Date();
	var dateStr = padStr(temp.getFullYear()) + "-" +
								padStr(1 + temp.getMonth()) +  "-" +
								padStr(temp.getDate()) + " " +
								padStr(temp.getHours()) + ":" +
								padStr(temp.getMinutes()) + ":" +
								padStr(temp.getSeconds());
	return dateStr
}

function saveToHistory(text) {

  $cache.getAsync({
		key: "history",
		handler: function(list) {
			if(list == undefined){
				list = new Array();
      }

      var data = {
        title:$text.MD5(text),
        content:text,
        date:printDate()
      }

      for (var index in list) {
        if(list[index].title === data.title){
          return
        }
      }

			var newList = new Array(data)
			newList = newList.concat(list)
			$cache.setAsync({
				key: "history",
				value: newList,
				handler: function(object) {

				}
			})
		}
	})

}

function deleteFromHistory(data){
  $cache.getAsync({
		key: "history",
		handler: function(list) {
			if(list == undefined){
				list = new Array();
      }

      var newList = new Array()
      for (var index in list) {
        if(list[index].title === data.title){
          continue
        }
        newList.push(list[index])
      }			

			$cache.setAsync({
				key: "history",
				value: newList,
				handler: function(object) {

				}
			})
		}
	})
}

module.exports = {
  parse:parse,
  clearHistory:clearHistory,
  saveToHistory:saveToHistory,
  deleteFromHistory:deleteFromHistory
}
