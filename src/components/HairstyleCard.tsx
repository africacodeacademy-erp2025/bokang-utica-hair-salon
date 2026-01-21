interface HairstyleCardProps {
  name: string;
  imageUrl: string;
}

export default function HairstyleCard({ name, imageUrl }: HairstyleCardProps) {
  return (
    <div className="hairstyle-card">
      <img src={imageUrl} alt={name} />
      <h3>{name}</h3>
    </div>
  );
}
