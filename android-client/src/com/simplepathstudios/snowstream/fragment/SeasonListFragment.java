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

import com.simplepathstudios.snowstream.MainActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.adapter.SeasonListAdapter;
import com.simplepathstudios.snowstream.api.model.Season;
import com.simplepathstudios.snowstream.viewmodel.SeasonListViewModel;

import java.util.List;

public class SeasonListFragment extends Fragment {
   private SeasonListViewModel seasonListViewModel;
   private RecyclerView seasonListElement;
   private LinearLayoutManager seasonListLayoutManager;
   private SeasonListAdapter seasonListAdapter;
   @Override
   public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
      return inflater.inflate(R.layout.season_list_fragment, container, false);
   }

   @Override
   public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
      super.onViewCreated(view, savedInstanceState);

      int showId = getArguments().getInt("ShowId");
      String showName = getArguments().getString("ShowName");

      seasonListElement = view.findViewById(R.id.season_list);
      seasonListAdapter = new SeasonListAdapter();
      seasonListElement.setAdapter(seasonListAdapter);
      seasonListLayoutManager = new LinearLayoutManager(getActivity());
      seasonListElement.setLayoutManager(seasonListLayoutManager);
      seasonListViewModel = new ViewModelProvider(MainActivity.getInstance()).get(SeasonListViewModel.class);
      seasonListViewModel.Data.observe(getViewLifecycleOwner(), new Observer<List<Season>>() {
         @Override
         public void onChanged(List<Season> seasonList) {
            seasonListAdapter.setData(seasonList);
            seasonListAdapter.notifyDataSetChanged();
         }
      });
      seasonListViewModel.load(showId);
   }
}
