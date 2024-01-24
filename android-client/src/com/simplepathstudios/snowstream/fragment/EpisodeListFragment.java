package com.simplepathstudios.snowstream.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.adapter.EpisodeListAdapter;
import com.simplepathstudios.snowstream.api.model.Episode;
import com.simplepathstudios.snowstream.viewmodel.EpisodeListViewModel;

import java.util.List;

public class EpisodeListFragment extends Fragment {
   private EpisodeListViewModel episodeListViewModel;
   private RecyclerView episodeListElement;
   private LinearLayoutManager episodeListLayoutManager;
   private EpisodeListAdapter episodeListAdapter;
   @Override
   public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
      return inflater.inflate(R.layout.episode_list_fragment, container, false);
   }

   @Override
   public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
      super.onViewCreated(view, savedInstanceState);

      int seasonId = getArguments().getInt("SeasonId");
      String seasonName = getArguments().getString("SeasonName");

      episodeListElement = view.findViewById(R.id.episode_list);
      episodeListAdapter = new EpisodeListAdapter();
      episodeListElement.setAdapter(episodeListAdapter);
      episodeListLayoutManager = new LinearLayoutManager(getActivity());
      episodeListElement.setLayoutManager(episodeListLayoutManager);
      episodeListViewModel = new ViewModelProvider(this).get(EpisodeListViewModel.class);
      episodeListViewModel.Data.observe(getViewLifecycleOwner(), new Observer<List<Episode>>() {
         @Override
         public void onChanged(List<Episode> episodeList) {
            episodeListAdapter.setData(episodeList);
            episodeListAdapter.notifyDataSetChanged();
         }
      });
      episodeListViewModel.load(seasonId);
   }
}
