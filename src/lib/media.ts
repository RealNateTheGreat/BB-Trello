export const isVideoUrl = (url: string) => {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
};
