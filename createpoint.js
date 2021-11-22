(async (prog)=>{
  var descProg = $window.instances[$window.instances.length-1].el.body.children[0].children[0]
  function loadAsPromise(path){
  	return new Promise(r=>$file.open(path,r))
  }
  var fileAmt = 0
  await recurse("/a/",true)
  var dir = {}
  var amtRecursed = 0
  async function recurse(path,count=false){
    var ex = $fs.utils.exist(path)
    Object.keys(ex).forEach(async key=>{
    	if(ex[key] == 0){
          if(!count){
            amtRecursed++
            descProg.innerText = "Load File: "+path+key
            prog.update(amtRecursed/fileAmt*33+33)
            dir[path+key] = await loadAsPromise(path+key)
          }
          else fileAmt++
        }else if(typeof ex[key] === "object"){
          await recurse(path+key+"/",count)
        }
    })
  }
  descProg.innerText = "Preparing to store..."
  var t = new localforage.constructor()
  t._config.name = "win93Restore"
  t._config.storeName = "restorePoints"
  var prev = {}
  descProg.innerText = "Generate previous point list..."
  var k = await t.keys()
  for(var idx in k){
    let key = k[idx]
    prog.update(idx/k.length*25+25)
  	prev[key] = await t.getItem(key)
  }
  delete prev["latest"]
  descProg.innerText = "Loading main tree..."
  await recurse("/a/")
  prog.update(66+.5*33)
  descProg.innerText = "Creating restore point"
  var point = {
    fs:dir,
    time:Date(),
    prevPoints:prev
  }
  prog.update(99)
  descProg.innerText = "Storing point..."
  t.setItem(point.time,point)
  t.setItem("latest",point)
  descProg.innerText = "Done!"
  prog.update(100)
  return point
})($alert.progress("Enumerating filesystem..."))
