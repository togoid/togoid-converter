// @ts-check
import React, { useState } from "react";

/**
 * @param {{ children: string; copyFunction: Function; isReduced?: boolean }} props
 */
const ResultModalClipboardButton = (props) => {
  const [isShowCopied, setIsShowCopied] = useState(false);

  const handleClipboardButton = async () => {
    await props.copyFunction(props.isReduced);

    setIsShowCopied(true);
    setTimeout(() => {
      setIsShowCopied(false);
    }, 1000);
  };

  return (
    <button onClick={handleClipboardButton} className="button_icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="13.895"
        viewBox="0 0 12 13.895"
        className="button_icon__icon"
      >
        <path
          d="M12.737,13.632H5.789V4.789h6.947m0-1.263H5.789A1.263,1.263,0,0,0,4.526,4.789v8.842a1.263,1.263,0,0,0,1.263,1.263h6.947A1.263,1.263,0,0,0,14,13.632V4.789a1.263,1.263,0,0,0-1.263-1.263M10.842,1H3.263A1.263,1.263,0,0,0,2,2.263v8.842H3.263V2.263h7.579Z"
          transform="translate(-2 -1)"
          fill="#fff"
        />
      </svg>
      <span>{isShowCopied ? "Copied." : props.children}</span>
    </button>
  );
};

export default ResultModalClipboardButton;
