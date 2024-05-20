export const useCopy = (text: string) => {
  const toast = useToast();
  try {
    navigator.clipboard.writeText(text);
  } catch (err) {
    console.error(err);
    toast.add({
      title: "复制失败",
      description: "请使用更现代的浏览器",
    });
    return;
  }
  toast.add({
    title: "复制成功",
    description: "已复制配置到剪贴板",
  });
};
