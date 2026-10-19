import { useEffect, useState } from "react";
import { useDocumentOperation, type DocumentActionComponent } from "sanity";

/**
 * 來店資訊專用的發布按鈕：發布時自動寫入「最後核對時間」。
 * 「資訊已核對」未勾選時，欄位驗證會擋下發布。
 */
export const PublishWithVerify: DocumentActionComponent = (props) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (isPublishing && !props.draft) setIsPublishing(false);
  }, [props.draft, isPublishing]);

  return {
    disabled: Boolean(publish.disabled),
    label: isPublishing ? "發布中…" : "核對並發布",
    tone: "positive",
    onHandle: () => {
      setIsPublishing(true);
      patch.execute([{ set: { verifiedAt: new Date().toISOString() } }]);
      publish.execute();
      props.onComplete();
    },
  };
};
