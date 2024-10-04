import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";

import { postRequestWithNativeFetch } from "./fetch";

const MASK_PATH = "/production/predict";
const MASK_API_KEY = "";

const FILL_API_KEY = "";
const IMAGE_FILL_PATH =
  "https://ilamfp52bwy5cnjt.us-east-1.aws.endpoints.huggingface.cloud/";

interface EncodedFile {
  name: string;
  size: number;
  encoded: string;
}

function App() {
  const [input, setInput] = useState("");
  const [encodedFile, setEncodedFile] = useState<EncodedFile | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cleanedImage, setCleanedImage] = useState<string | null>(null);

  const loadFile = (file: File): Promise<EncodedFile> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      const base = {
        name: file.name,
        size: file.size,
      };
      reader.addEventListener("abort", (e) => rej(`File upload aborted:${e}`));
      reader.addEventListener("error", (e) => rej(`File upload error: ${e}`));
      reader.addEventListener("load", () => {
        setPreviewImage(reader.result as string);
        return (
          res({
            ...base,
            encoded: reader.result as string,
          }),
          false
        );
      });
      reader.readAsDataURL(file);
    });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const loadAndSetFile = async () => {
      const file = await loadFile(acceptedFiles[0]);
      setEncodedFile(file);
    };
    loadAndSetFile();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ["image/jpeg", "image/png", "image/gif", "image/*"],
    maxSize: 100000000, // 100 mb
    onDrop,
  });

  const handleChange = (event) => {
    setInput(event.target.value);
  };

  const removeFurniture = async () => {
    const values = {
      workflow_values: {
        prompt: input,
        image: {
          type: "image",
          data: encodedFile?.encoded.split("base64,")[1],
        },
      },
    };
    const mask = await postRequestWithNativeFetch(
      MASK_PATH,
      { Authorization: `Api-Key ${MASK_API_KEY}` },
      values
    );

    const cleanedImage = await postRequestWithNativeFetch(
      IMAGE_FILL_PATH,
      {
        Authorization: `Bearer ${FILL_API_KEY}`,
        "content-type": "application/json",
      },
      {
        inputs: {
          prompt:
            "high quality, floor or carpet and walls, whatever is behind the mask",
          source_image_url: encodedFile?.encoded.split("base64,")[1],
          mask_image_url: mask.result[0].data,
        },
      }
    );
    setCleanedImage(cleanedImage);
    console.log({ cleanedImage });
  };

  return (
    <>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        {previewImage ? (
          <img src={previewImage} className="image" />
        ) : isDragActive ? (
          <p>Drop the file here</p>
        ) : (
          <p>Drag and drop an image here, or click to select files</p>
        )}
      </div>

      {cleanedImage && (
        <img src={`data:image/png;base64,${cleanedImage}`} className="image" />
      )}

      <div className="card">
        <label className={"input-wrapper"}>
          What would you like to remove?
          <input type={"text"} value={input} onChange={handleChange}></input>
        </label>
        <button onClick={() => removeFurniture()}>Remove furniture</button>
      </div>
      <p className="read-the-docs">
        Click on the "Remove furniture" button to let us (attempt to) remove the
        furniture
      </p>
    </>
  );
}

export default App;
