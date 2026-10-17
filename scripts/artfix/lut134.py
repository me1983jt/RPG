"""Colour masks for lying/death/down/crouch frames: learn old->new colour per character from the upright sheets."""
import numpy as np, glob
from lib import load
O2 = '/workspace/maine-rpg/art-backup-v13.2/game/'; O3 = '/workspace/maine-rpg/art-backup-v13.3/game/'
Q = 12
def key(rgb): q = np.clip(rgb // Q, 0, 255 // Q).astype(np.int32); n = 255 // Q + 1; return (q[..., 0] * n + q[..., 1]) * n + q[..., 2]
def build(files):
    n = (255 // Q + 1) ** 3; acc = np.zeros((n, 3)); cnt = np.zeros(n)
    for f in files:
        a = load(O2 + f); b = load(O3 + f)
        if a.shape != b.shape: continue
        m = (a[..., 3] >= 200) & (b[..., 3] >= 200)
        k = key(a[m][:, :3]); d = b[m][:, :3] - a[m][:, :3]
        np.add.at(acc, k, d); np.add.at(cnt, k, 1)
    return acc, cnt
def apply(a, lut, minc=3):
    acc, cnt = lut; out = a.copy(); m = a[..., 3] > 0
    k = key(a[m][:, :3]); c = cnt[k]; d = np.where((c >= minc)[:, None], acc[k] / np.maximum(c, 1)[:, None], 0)
    out[m, :3] = np.clip(a[m][:, :3] + d, 0, 255)
    return out, int((c >= minc).sum())
