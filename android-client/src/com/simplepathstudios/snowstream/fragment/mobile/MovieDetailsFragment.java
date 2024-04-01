package com.simplepathstudios.snowstream.fragment.mobile;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.SurfaceView;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;

import com.simplepathstudios.snowstream.MobileActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.VideoPlayer;
import com.simplepathstudios.snowstream.api.model.Movie;
import com.simplepathstudios.snowstream.viewmodel.MovieDetailsViewModel;

public class MovieDetailsFragment extends Fragment {
   private SurfaceView videoLayout;
   private MovieDetailsViewModel viewModel;
   @Override
   public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                            @Nullable Bundle savedInstanceState) {
      return inflater.inflate(R.layout.mobile_movie_details_fragment, container, false);
   }

   @Override
   public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
      super.onViewCreated(view, savedInstanceState);

      int movieId = getArguments().getInt("MovieId");
      String movieName = getArguments().getString("MovieName");

      viewModel = Util.getApp().getViewModel(MovieDetailsViewModel.class);
      viewModel.Data.observe(getViewLifecycleOwner(), new Observer<Movie>() {
         @Override
         public void onChanged(Movie movie) {
            videoLayout = view.findViewById(R.id.video_layout);
            VideoPlayer.getInstance().useSurface(videoLayout.getHolder().getSurface());
            VideoPlayer.getInstance().play(movie.video_files.get(0).web_path);
         }
      });
      viewModel.load(movieId);
   }
}
