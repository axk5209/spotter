const posesCollection = [[], []]
const sketchCreator = (filename) => {
  return (sketch) => {
    const index = filename === "PoseNetTest1A.mp4" ? 0 : 1
    var video;
    var videofile = filename;
    let poseNet;
    let poses = [];
    let skeletons = [];
    let playing = false

    sketch.setup = () => {
      sketch.createCanvas(400, 400);
      video = sketch.createVideo(videofile, sketch.onLoad);
      
      //Posenet
      poseNet = ml5.poseNet(video, sketch.modelReady);
      poseNet.on('pose', sketch.printPose);

      poseNet.on('pose', function(results) {
        poses = results;
      });
      video.hide();
    }

    sketch.onLoad = () => { // This function is called when the video loads
      //  print("start auto play after load");
      //  video.play();
      video.size(400, 400);
      video.volume(0)
      video.onended(function () {
        playing = false
        console.log(posesCollection[index])
      })
      video.addCue(0.0, function () {
        //console.log("cue acknowledged")
        playing = true
      })
      video.addCue(0.01, function () {
        //console.log("cue acknowledged")
        playing = true
      })
      video.speed(0.25)
      setTimeout(() => {
        video.play()
      }, 3000)
      print("mouse click to start");
    }

    sketch.modelReady = () => {
      poseNet.singlePose()
    }

    //Pose Net 
    sketch.printPose = (poses) => {
      //console.log(playing)
      if (playing)
      {
        
        // console.log({
        //   time: video.time(),
        //   poses: poses[0].pose.keypoints
        //     .map(item => item.position)
        // })

        posesCollection[index].push({
          time: video.time(),
          poses: poses[0].pose.keypoints
            .map(item => item.position)
        })
      }
    }

    sketch.draw = () => {
      sketch.image(video, 0, 0, sketch.width, sketch.height);

      // We can call both functions to draw all keypoints and the skeletons
      sketch.drawKeypoints();
      sketch.drawSkeleton();
    }
    //=======Draw skeleton and keypoints ===/

    // A function to draw ellipses over the detected keypoints
    sketch.drawKeypoints = () => {
      //console.log("drawing keypoints")
      // Loop through all the poses detected
      for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
          // A keypoint is an object describing a body part (like rightArm or leftShoulder)
          let keypoint = poses[i].pose.keypoints[j];
          if (keypoint.score > 0.1) {
            sketch.fill(255, 0, 0);
            sketch.noStroke();
            sketch.ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
          }
        }
      }
    }

    // A function to draw the skeletons
    sketch.drawSkeleton = () => {
      // Loop through all the skeletons detected
      for (let i = 0; i < poses.length; i++) {
        // For every skeleton, loop through all body connections
        for (let j = 0; j < poses[i].skeleton.length; j++) {
          let partA = poses[i].skeleton[j][0];
          let partB = poses[i].skeleton[j][1];
          sketch.stroke(255, 0, 0);
          sketch.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
      }
    }
    //======End skeleton ============/



    sketch.mousePressed = () => {
      video.play();
      video.speed(0.25) // set the video to loop mode ( and start )
      //print("set loop mode");
    }

  }
  
}

///Get 
let myp5 = new p5(
  sketchCreator('PoseNetTest1A.mp4'), 
  document.getElementById('p5sketch')
);
let myp52 = new p5( 
  sketchCreator('PoseNetTest1B.mp4'),
  document.getElementById('p5sketch2')
);









/*
const sketchCreator = (filename) => {
  return (sketch) => {
    var video;
    var videofile = filename;
    let poseNet;
    let poses = [];
    let skeletons = [];

    sketch.setup = () => {
      sketch.createCanvas(400, 400);
      video = sketch.createVideo(videofile, sketch.onLoad);
      //Posenet
      poseNet = ml5.poseNet(video, sketch.modelReady);
      

      poseNet.on('pose', function(results) {
        poses = results;
      });
      video.hide();
    }

    sketch.onLoad = () => { // This function is called when the video loads
      //  print("start auto play after load");
      //  video.play();
      video.size(400, 400);
      video.volume(0)
      setTimeout(() => {
        video.speed(0.25)
        video.play()
      }, 10000)
      print("mouse click to start");
    }

    sketch.modelReady = () => {
      poseNet.singlePose()
    }

    //Pose Net 
    sketch.printPose = (poses) => {
      console.log({
        time: video.time(),
        poses: poses[0].pose.keypoints
          .map(item => item.position)
      })
    }

    sketch.draw = () => {
      sketch.image(video, 0, 0, sketch.width, sketch.height);

      // We can call both functions to draw all keypoints and the skeletons
      sketch.drawKeypoints();
      sketch.drawSkeleton();
    }
    //=======Draw skeleton and keypoints ===/

    // A function to draw ellipses over the detected keypoints
    sketch.drawKeypoints = () => {
      //console.log("drawing keypoints")
      // Loop through all the poses detected
      for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
          // A keypoint is an object describing a body part (like rightArm or leftShoulder)
          let keypoint = poses[i].pose.keypoints[j];
          if (keypoint.score > 0.1) {
            sketch.fill(255, 0, 0);
            sketch.noStroke();
            sketch.ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
          }
        }
      }
    }

    // A function to draw the skeletons
    sketch.drawSkeleton = () => {
      // Loop through all the skeletons detected
      for (let i = 0; i < poses.length; i++) {
        // For every skeleton, loop through all body connections
        for (let j = 0; j < poses[i].skeleton.length; j++) {
          let partA = poses[i].skeleton[j][0];
          let partB = poses[i].skeleton[j][1];
          sketch.stroke(255, 0, 0);
          sketch.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
      }
    }
    //======End skeleton ============/



    sketch.mousePressed = () => {
      video.play();
      video.speed(0.25) // set the video to loop mode ( and start )
      //print("set loop mode");
    }

  }
  
}
*/
