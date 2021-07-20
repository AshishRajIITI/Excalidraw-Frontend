import React, { useEffect, useState, useRef } from "react";
import Excalidraw, {
  exportToCanvas,
} from "@excalidraw/excalidraw";
import axios from "axios";
import "./styles.css";


export default function App() {
  const excalidrawRef = useRef(null);
  const [canvasUrl, setCanvasUrl] = useState(null);

  useEffect(() => {
    const onHashChange = () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const libraryUrl = hash.get("addLibrary");
      if (libraryUrl) {
        excalidrawRef.current.importLibrary(libraryUrl, hash.get("token"));
      }
    };
    window.addEventListener("hashchange", onHashChange, false);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  
  const generateImageURL = () => {
    const canvas = exportToCanvas({
      elements: excalidrawRef.current.getSceneElements(),
      appState: {}
    })
    const ctx = canvas.getContext("2d");
    setCanvasUrl(canvas.toDataURL())
    //console.log(canvasUrl);

    // var bodyFormData = new FormData();
    // bodyFormData.append('image', canvasUrl); 

    axios.post("https://excalidraw-ashish.herokuapp.com/create", { canvasUrl: canvasUrl })
      .then(() => {
        console.log("success");
      })
      .catch((err) => {
        console.log(err);
      });

    // axios({
    //   method: "post",
    //   url: "http://localhost:8000",
    //   data: bodyFormData,
    //   headers: { "Content-Type": "multipart/form-data" },
    // })
    //   .then((response) =>{
    //     //handle success
    //     console.log(response);
    //   })
    //   .catch((response) => {
    //     //handle error
    //     console.log(response);
    //   });

  }

  const throttle = (fn, limit) => {
    let flag = true;
    return function () {
      let context = this;
      let args = arguments;
      if (flag) {
        fn.apply(context, args);
        flag = false;
        setTimeout(() => {
          flag = true;
        }, limit);
      }
    }
  }

  const throttleFunction = throttle(generateImageURL, 10000);

  const [imageList, setImageList] = useState([]);

  const showImageList = imageList?.reverse().map((eachImage) => {
    return (<li style={{ decoration: 'none' }} key={eachImage._id}><a href={eachImage.imageUrl} download >{eachImage._id}</a></li>)
  })


  return (
    <div className="App">
      <h1> My Excalidraw Example</h1>
   
        <div className="excalidraw-wrapper">
          <Excalidraw
            ref={excalidrawRef}

            //included the throttling function which run very 10 secs;
            onChange={() =>  throttleFunction()}

            onCollabButtonClick={() =>
              window.alert("You clicked on collab button")
            }
            name="Custom name of drawing"
            UIOptions={{ canvasActions: { loadScene: false } }}

          />
        </div>

        <div className="export-wrapper button-wrapper">

          <button
            className="buttonDisplayImages"
            onClick={() => {
              axios.get("https://excalidraw-ashish.herokuapp.com/getImages")
                .then((response) => {
                  const imageData = response.data;
                  console.log(imageData);
                  setImageList(imageData);
                })
                .catch((error) => {
                  console.log(error);
                })
            }}
          >
            Show previous saved drawings
          </button>

          <div className="export export-canvas">

            <ul style={{ decoration: 'none' }}>
              {imageList && showImageList}
            </ul>
          </div>

        </div>
    </div>
  );
}
