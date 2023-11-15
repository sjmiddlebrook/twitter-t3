import React, { useState, useRef, useCallback, useEffect } from "react";

type ResizableTextAreaProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const ResizableTextArea: React.FC<ResizableTextAreaProps> = ({
  value,
  onChange,
  ...rest
}) => {
  const [text, setText] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resizeTimeoutRef = useRef<number | undefined>(undefined);

  const resizeTextArea = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    function handleResize() {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = window.setTimeout(() => {
        resizeTextArea();
      }, 100);
    }
    window.addEventListener("resize", handleResize);
    // Remove event listener and clear timeout on cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeoutRef.current);
    };
  }, [resizeTextArea]);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    resizeTextArea();
  }, [text, resizeTextArea]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={handleChange}
      {...rest}
      style={{ overflow: "hidden" }}
    />
  );
};

export default ResizableTextArea;
