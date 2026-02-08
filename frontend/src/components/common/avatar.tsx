type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const colorPairs = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-indigo-500 to-blue-500',
];

const Avatar = ({ name, imageUrl, size = 'md', className = '' }: AvatarProps) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  // 이름 기반 고정 색상 선택
  const colorIndex = name
    ? name.charCodeAt(0) % colorPairs.length
    : 0;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        flex items-center justify-center rounded-lg
        bg-gradient-to-br ${colorPairs[colorIndex]}
        font-semibold text-white shadow-sm
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {initials}
    </div>
  );
};

export default Avatar;
