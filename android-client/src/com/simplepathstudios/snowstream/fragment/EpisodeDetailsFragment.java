package com.simplepathstudios.snowstream.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.SurfaceView;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;

import com.simplepathstudios.snowstream.MainActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.VideoPlayer;
import com.simplepathstudios.snowstream.api.model.Episode;
import com.simplepathstudios.snowstream.viewmodel.EpisodeDetailsViewModel;

public class EpisodeDetailsFragment extends Fragment {
   private SurfaceView videoLayout;
   private EpisodeDetailsViewModel viewModel;

   @Override
   public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                            @Nullable Bundle savedInstanceState) {
      return inflater.inflate(R.layout.episode_details_fragment, container, false);
   }

   @Override
   public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
      super.onViewCreated(view, savedInstanceState);

      int showId = getArguments().getInt("ShowId");
      int episodeId = getArguments().getInt("EpisodeId");
      String episodeName = getArguments().getString("EpisodeName");

      viewModel = new ViewModelProvider(MainActivity.getInstance()).get(EpisodeDetailsViewModel.class);
      viewModel.Data.observe(getViewLifecycleOwner(), new Observer<Episode>() {
         @Override
         public void onChanged(Episode episode) {
            videoLayout = view.findViewById(R.id.video_layout);
            VideoPlayer.getInstance().useSurface(videoLayout.getHolder().getSurface());
            VideoPlayer.getInstance().play(episode.video_files.get(0).web_path);
         }
      });
      viewModel.load(episodeId);
   }
}
