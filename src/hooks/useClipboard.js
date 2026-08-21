import { useState } from 'react';
import toast from 'react-hot-toast';

export const useClipboard = (options = { successDuration: 2000 }) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = async (text) => {
        if (!navigator?.clipboard) {
            toast.error("Clipboard not supported");
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast.success("Copied!");
            setTimeout(() => {
                setIsCopied(false);
            }, options.successDuration);
            return true;
        } catch (error) {
            console.error("Failed to copy text:", error);
            toast.error("Failed to copy");
            setIsCopied(false);
            return false;
        }
    };

    return { isCopied, copyToClipboard };
};
