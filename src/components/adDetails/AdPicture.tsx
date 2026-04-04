import { Image } from '@mantine/core';

interface AdPictureProps {
  title: string;
}

export function AdPicture({ title }: AdPictureProps) {
  return (
    <Image
      src={'https://placehold.co/400x250?text=Нет+фото'}
      height="360px"
      alt={title}
      fit="cover"
      style={{ width: '480px' }}
    />
  );
}