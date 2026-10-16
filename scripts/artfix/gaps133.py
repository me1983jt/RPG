import numpy as np
from scipy import ndimage
from lib import magenta_mask, green_mask

def grow_fill(a, fill):
    """Give each fill pixel the colour of nearby opaque pixels, growing inward; set alpha 255."""
    out = a.copy(); known = (a[..., 3] >= 200) & ~fill; todo = fill.copy()
    k = np.ones((3, 3), np.float32)
    for _ in range(40):
        if not todo.any(): break
        w = ndimage.convolve(known.astype(np.float32), k, mode='constant')
        s = np.stack([ndimage.convolve(out[..., c] * known, k, mode='constant') for c in range(3)], -1)
        ready = todo & (w > 0)
        out[ready, :3] = s[ready] / w[ready][:, None]; out[ready, 3] = 255
        known |= ready; todo &= ~ready
    out[todo, 3] = 255
    return out

def fix_gaps(a, thin=1.6, small=14):
    st = {}
    al = a[..., 3]
    # fringe on the outline only
    edge = ndimage.binary_dilation(al < 20, iterations=2)
    bad = (magenta_mask(a, .3, .12) | green_mask(a)) & edge & (al > 0)
    if bad.any():
        a = grow_fill(a, np.zeros_like(bad)) if False else a
        a = a.copy(); a[bad, 3] = 0; st['fringe'] = int(bad.sum())
        al = a[..., 3]
    # light speckle on the outline (keying halo): much brighter than the body just inside
    lum = a[..., :3] @ np.array([.3, .59, .11], np.float32)
    solid = (al >= 200).astype(np.float32)
    k = np.ones((5, 5), np.float32)
    inner = ndimage.binary_erosion(al >= 200, np.ones((3, 3)))
    w = ndimage.convolve(inner.astype(np.float32), k, mode='constant'); sm = ndimage.convolve(lum * inner, k, mode='constant')
    rim = (al > 0) & ~inner & (w >= 3)
    halo = rim & (lum > sm / np.maximum(w, 1) + 75)
    if halo.any():
        a = a.copy(); a[halo, 3] = 0; st['halo pixels'] = int(halo.sum()); al = a[..., 3]
    O = al >= 200
    # thin cut lines open to the outside: anything closing with a 3x3 bridges
    C = ndimage.binary_closing(O, np.ones((3, 3)), iterations=1, border_value=0) & ~O
    # vertical/horizontal 1-3 px seams through the body
    for s in (np.ones((7, 1)),):
        C |= ndimage.binary_closing(O, s, border_value=0) & ~O
    st['cuts'] = int(C.sum())
    O2 = O | C
    holes = ~O2
    lab, k = ndimage.label(holes)
    border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fill = C.copy(); gap = np.zeros_like(O); nf = ng = 0
    if k:
        dist = ndimage.distance_transform_edt(holes)
        objs = ndimage.find_objects(lab)
        for i, sl in enumerate(objs, 1):
            if i in border: continue
            m = lab[sl] == i; area = m.sum()
            if area <= small or dist[sl][m].max() <= thin:
                fill[sl] |= m; nf += area
            else:
                gap[sl] |= m; ng += area
    st['holes filled'] = int(nf); st['real gaps cleared'] = int(ng)
    out = grow_fill(a, fill)
    out[gap, 3] = 0
    # semi-alpha inside the body (not on the outline)
    deep = ndimage.distance_transform_edt(out[..., 3] >= 20) > 2.5
    semi = (out[..., 3] < 250) & deep
    out[semi, 3] = 255; st['semi-alpha set solid'] = int(semi.sum())
    return out, st
