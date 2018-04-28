var app = require('scripts/app');


var text = ""
if($context.data != undefined) {
	text = $context.data.string
}else if($context.text != undefined){
	text = $context.text
}else if ($clipboard.text != undefined) {
	text = $clipboard.text
	$clipboard.clear()
}

var dict = $cache.get("myDict")
if (dict == null) {
  dict = {}
}

var listView = {
	views: [
		{
			type: "list",
			props: {
			  data: [],
			  actions: [
				{
				  title: "认识",
				  handler: function(tableView, indexPath) {
					  var data = tableView.object(indexPath)
					  dict[data] = "1";
					  $cache.setAsync({
							key: "myDict",
							value: dict,
							handler: function(object) {
								tableView.delete(indexPath)
							}
						})
					
				  }
				}
			  ]
			},
			layout: $layout.fill,
			events: {
				didSelect: function(tableView, indexPath, data) {
					$app.openURL("eudic://dict/"+data)
				},
				rowHeight: function(sender, indexPath) {
						return 60
				}
			},
			
		  }
	]
	}
	
var inputView = {
	views: [
		{
			type: "text",
			props: {
				id:"input",
				text: text
			},
			layout: $layout.fill,
			events: {
				didChange: function(sender) {

				}
			}
		}
		,
		{
			type: "button",
			props: {
			title: "清空"
			},
			layout: function(make, view) {
				make.height.equalTo(50)
				make.width.equalTo(view.super.width)
				make.bottom.equalTo(view.super.bottom).offset(-70)
			},
			events: {
				tapped: function(sender) {
					$("input").text=""
				}
			}
		},
		{
			type: "button",
			props: {
			title: "确认"
			},
			layout: function(make, view) {
				make.height.equalTo(50)
				make.width.equalTo(view.super.width)
				make.bottom.equalTo(view.super.bottom).offset(-10)
			},
			events: {
				tapped: function(sender) {
					listView.views[0].props.data = app.parse($("input").text,dict)
					$ui.push(listView)
				}
			}
		}
	]
	}

	var historyListView = {
		views: [
			{
				type: "list",
				props: {
          template: [{
						type: "label",
						props: {
							id: "titleLabel",
							font: $font(20)
						},
						layout: function(make) {
							make.left.equalTo(15)
							make.top.right.inset(8)
							make.height.equalTo(24)
						}
					},
					{
						type: "label",
						props: {
							id: "dateLabel",
							textColor: $color("#888888"),
							font: $font(15)
						},
						layout: function(make) {
							make.left.right.equalTo($("titleLabel"))
							make.top.equalTo($("titleLabel").bottom)
							make.bottom.equalTo(0)
						}
					}
				],
					data: [],
					actions: [
					{
						title: "删除",
						handler: function(tableView, indexPath) {
							var data = tableView.object(indexPath)
							app.deleteFromHistory(data)
							tableView.delete(indexPath)
						}
					}
					]
				},
				layout: $layout.fill,
				events: {
					didSelect: function(tableView, indexPath, data) {
						listView.views[0].props.data = app.parse(data.content,dict)
						$ui.push(listView)
					},
					rowHeight: function(sender, indexPath) {
							return 60
					}
				},
				
				},
				{
					type: "button",
					props: {
					title: "清空"
					},
					layout: function(make, view) {
						make.height.equalTo(50)
						make.width.equalTo(view.super.width)
						make.bottom.equalTo(view.super.bottom).offset(-10)
					},
					events: {
						tapped: function(sender) {
							app.clearHistory(function(){
								loadHistoryListView()
							});
						}
					}
				},
		]
		}

function loadHistoryListView(){

	$ui.loading(true)
	$cache.getAsync({
		key: "history",
		handler: function(list) {
			if(list == undefined){
				list = new Array();
			}

			historyListView.views[0].props.data = list.map(function(item) {
				item["titleLabel"] = {
						text:item.title
				}
				item["dateLabel"] = {
					text:item.date
				}
				return item
			})
			$ui.loading(false)
			$ui.render(historyListView)
		}
	})

}

if(text <= 0){
	loadHistoryListView()
}else {
	app.saveToHistory(text)
	listView.views[0].props.data = app.parse(text,dict)
	$ui.render(listView)
}


