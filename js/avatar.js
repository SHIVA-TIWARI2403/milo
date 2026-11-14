/**
 * Milo — Dynamic Avatar System
 * Generates modern CSS gradient or photo avatars with initials fallback
 * @author Shiva Tiwari
 */

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#ff8a5c,#ea580c)',
  'linear-gradient(135deg,#8b6cff,#6366f1)',
  'linear-gradient(135deg,#2fd3a7,#059669)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#06b6d4,#3b82f6)'
];

function getInitials(name) {
  if (!name) return 'M';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function createAvatar(name, size = 'md', photoUrl = null) {
  const div = el('div', 'avatar avatar-' + size);
  if (photoUrl) {
    const img = document.createElement('img');
    img.src = photoUrl;
    img.alt = name || 'User';
    img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover';
    img.onerror = () => {
      img.remove();
      div.textContent = getInitials(name);
    };
    div.append(img);
  } else {
    let hash = 0;
    const str = name || 'Milo';
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % AVATAR_GRADIENTS.length;
    }
    div.style.background = AVATAR_GRADIENTS[Math.abs(hash)];
    div.textContent = getInitials(name);
  }
  return div;
}
