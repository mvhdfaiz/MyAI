
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = "w-5 h-5" }) => (
  <i data-lucide={name} className={className}></i>
);

export const Icons = {
  GeneratorIcon: () => <Icon name="layout-grid" />,
  GalleryIcon: () => <Icon name="gallery-vertical" />,
  SaveIcon: () => <Icon name="save" />,
  DeleteIcon: () => <Icon name="trash-2" />,
  UsePromptIcon: () => <Icon name="pen-square" />,
  UploadIcon: () => <Icon name="upload" />,
  AnalyzeIcon: () => <Icon name="scan-eye" />,
  SparklesIcon: () => <Icon name="sparkles" />,
  BackIcon: () => <Icon name="arrow-left" />,
  MaximizeIcon: () => <Icon name="maximize" />,
  SaveAllIcon: () => <Icon name="gallery-thumbnails" />,
  EnhanceIcon: () => <Icon name="wand-2" />,
  VariationsIcon: () => <Icon name="copy-plus" />,
  CloseIcon: () => <Icon name="x" />,
  ViewInGeneratorIcon: () => <Icon name="image-plus" />,
};
