export const Router = {
  go(hash) {
    const viewId = 'view-' + hash.replace('#/', '');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
  },
  init() {
    this.go('#/login'); // default view
  }
};
