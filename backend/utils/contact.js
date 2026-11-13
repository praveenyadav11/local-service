const SHARE_STATUSES = ['confirmed', 'completed'];

const maskContacts = (booking, viewer) => {
  const b = booking.toObject ? booking.toObject() : { ...booking };
  const share = SHARE_STATUSES.includes(b.status);
  const admin = viewer.role === 'admin';
  const viewerId = viewer._id.toString();

  if (b.customer && typeof b.customer === 'object' && b.customer._id) {
    const own = b.customer._id.toString() === viewerId;
    if (!(own || admin || share)) delete b.customer.phone;
  }

  const providerUser = b.provider && b.provider.user;
  if (providerUser && typeof providerUser === 'object' && providerUser._id) {
    const own = providerUser._id.toString() === viewerId;
    if (!(own || admin || share)) delete providerUser.phone;
  }

  return b;
};

module.exports = { maskContacts };