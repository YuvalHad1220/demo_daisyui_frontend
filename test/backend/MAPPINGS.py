import os


def get_video_model_paths(scene_name: str) -> dict | None:
    base_raw = os.path.expanduser("~/DEV/sparse_codec/data/raw")
    base_model = os.path.expanduser("~/models/sparse_video_codec")

    scene_map = {
        "sample_1080p30": {
            "raw_file": "sample_1080p30.mp4",
            "model_file": "timestamp_sparse_codec_test1-epoch=49-val_loss=0.008321.ckpt",
        },
        "snow_road": {
            "raw_file": "snow_road.mkv",
            "model_file": "timestamp_sparse_codec_snow_road-epoch=41-val_loss=0.005177.ckpt",
        },
        "lot": {
            "raw_file": "lot.mkv",
            "model_file": "timestamp_sparse_codec_lot-epoch=44-val_loss=0.001449.ckpt",
        },
        "lot_snow": {
            "raw_file": "lot_snow.mkv",
            "model_file": "timestamp_sparse_codec_lot_snow-epoch=49-val_loss=0.003937.ckpt",
        },
        "simple_road": {
            "raw_file": "simple_road.mkv",
            "model_file": "timestamp_sparse_codec_simple_road-epoch=32-val_loss=0.000993.ckpt",
        },
        "night_rainy_drive": {
            "raw_file": "night_rainy_drive.mp4",
            "model_file": "timestamp_sparse_codec_night_rainy_drive-epoch=48-val_loss=0.022807.ckpt",
        },
        "slow_speed_rear_bump": {
            "raw_file": "slow_speed_rear_bump.mp4",
            "model_file": "timestamp_sparse_codec_night_slow_speed_rear_bump-epoch=47-val_loss=0.013381.ckpt",
        },
    }

    if scene_name not in scene_map:
        return None

    entry = scene_map[scene_name]
    return {
        "raw_path": os.path.join(base_raw, entry["raw_file"]),
        "model_path": os.path.join(base_model, entry["model_file"]),
    }


if __name__ == "__main__":
    # Example usage
    paths = get_video_model_paths("simple_road")
    if paths:
        print(paths)
    else:
        print("Scene not found.")
