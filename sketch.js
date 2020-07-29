const posesCollection = [
  [],
  []
]
let complete = false
const posesCollector = (filename) => {
  return (sketch) => {
    const index = filename === "PoseNetTest1A.mp4" ? 0 : 1
    var video;
    var videofile = filename
    let poseNet;
    let playing = false

    sketch.setup = () => {
      sketch.noCanvas()
      video = sketch.createVideo(videofile, sketch.onLoad);
      poseNet = ml5.poseNet(video, sketch.modelCreated);
      poseNet.on('pose', sketch.savePoses);
      video.hide();
    }

    sketch.onLoad = () => {
      video.size(400, 400);
      video.volume(0)
      video.onended(function() {
        playing = false
        if (index === 1)
        {
          complete = true
          console.log(posesCollection)
          let vector1 = posesCollection[0][0].poses.map(item => [item.x, item.y]).flatten()
          let vector2 = posesCollection[1][0].poses.map(item => [item.x, item.y]).flatten()
            console.log(vector1)
            console.log(vector2)
          
//           let myp5Complete = new p5(
//           sketchCreator('PoseNetTest1A.mp4'), 
//           document.getElementById('p5sketch')
//           );

//           let myp5Complete2 = new p5( 
//             sketchCreator('PoseNetTest1B.mp4'),
//             document.getElementById('p5sketch2')
//           );
        }
      })
      video.addCue(0.0, function() {
        playing = true
      })
      video.addCue(0.01, function() {
        playing = true
      })
      video.speed(0.2)
      video.play()
    }

    sketch.modelCreated = () => {
      poseNet.singlePose()
    }
    //Pose Net 
    sketch.savePoses = (poses) => {
      if (playing) {
        //console.log(poses)
        posesCollection[index].push({
          time: video.time(),
          poses: poses[0].pose.keypoints
            .map(item => ({
              score: item.score, 
              x: item.position.x, 
              y: item.position.y}))
        })
      }
    }
  }
}

let myp5 = new p5(
  posesCollector('PoseNetTest1A.mp4')
);
let myp52 = new p5(
  posesCollector('PoseNetTest1B.mp4')
);



const sketchCreator = (filename) => {
  return (sketch) => {
    var video;
    var videofile = filename;
    let poseNet;
    let keypoints = [];
    let skeletons = [];
    const index = filename === "PoseNetTest1A.mp4" ? 0 : 1

    sketch.setup = () => {
      sketch.createCanvas(400, 400);
      video = sketch.createVideo(videofile, sketch.onLoad);
      video.hide();
    }

    sketch.onLoad = () => { 
      video.size(400, 400);
      video.volume(0)
      video.speed(0.25)
      video.play()
      video.addCue(0.0, function() {})
      posesCollection[index].forEach(pose => {
        video.addCue(pose.time, function() {
          keypoints = pose.poses
        })
      })
    }


    sketch.draw = () => {
      sketch.image(video, 0, 0, sketch.width, sketch.height);
      //console.log(video.time())
      //console.log(keypoints)
      sketch.drawKeypoints()
    }

    sketch.drawKeypoints = () => {
      for (let j = 0; j < keypoints.length; j++) {        
        let keypoint = keypoints[j];
        if (keypoint.score > 0.1)
        {
          sketch.fill(255, 0, 0);
          sketch.noStroke();
          sketch.ellipse(keypoint.x, keypoint.y, 10, 10);
        }
      }
    }
  }
}


