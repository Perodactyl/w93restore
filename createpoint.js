(async ()=>{
  function loadAsPromise(path){
  	return new Promise(r=>$file.open(path,r))
  }
  var dir = {}
  async function recurse(path){
    var ex = $fs.utils.exist(path)
    Object.keys(ex).forEach(async key=>{
    	if(ex[key] == 0){
          dir[path+key] = await loadAsPromise(path+key)
        }else if(typeof ex[key] === "object"){
          await recurse(path+key+"/")
        }
    })
  }
  var t = new localforage.constructor()
  t._config.name = "win93Restore"
  t._config.storeName = "restorePoints"
  console.log(t)
  var prev = {}
  var k = await t.keys()
  for(var idx in k){
    let key = k[idx]
  	prev[key] = await t.getItem(key)
  }
  delete prev["latest"]
  await recurse("/a/")
  var point = {
    fs:dir,
    time:Date(),
    prevPoints:prev
  }
  t.setItem(point.time,point)
  t.setItem("latest",point)
})()
