import Lottie from 'lottie-react';
import leafsData from '../animations/leafs.json';

export default function TopLeafs() {
  return (
    <div className="top-leafs">
      <Lottie
        animationData={leafsData}
        loop
        style={{
          width: '100%',
          height: '100%',
          transform: 'rotate(180deg)',
        }}
      />
    </div>
  );
}
