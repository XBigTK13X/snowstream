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
import com.simplepathstudios.snowstream.adapter.PosterListAdapter;
import com.simplepathstudios.snowstream.api.model.Episode;
import com.simplepathstudios.snowstream.api.model.Movie;
import com.simplepathstudios.snowstream.api.model.Season;
import com.simplepathstudios.snowstream.api.model.Show;
import com.simplepathstudios.snowstream.viewmodel.EpisodeListViewModel;
import com.simplepathstudios.snowstream.viewmodel.MovieListViewModel;
import com.simplepathstudios.snowstream.viewmodel.SeasonListViewModel;
import com.simplepathstudios.snowstream.viewmodel.ShowListViewModel;

import java.util.List;

public class PosterListFragment extends Fragment {
    private MovieListViewModel movieListViewModel;
    private ShowListViewModel showListViewModel;
    private SeasonListViewModel seasonListViewModel;
    private EpisodeListViewModel episodeListViewModel;
    private RecyclerView posterListElement;
    private LinearLayoutManager posterListLayoutManager;
    private PosterListAdapter posterListAdapter;
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.poster_list_fragment, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        int shelfId = getArguments().getInt("ShelfId");
        String shelfName = getArguments().getString("ShelfName");
        Integer showId  = getArguments().getInt("ShowId");
        String listKind = getArguments().getString("ListKind");
        Integer seasonId = getArguments().getInt("SeasonId");

        posterListElement = view.findViewById(R.id.poster_item_list);
        posterListAdapter = new PosterListAdapter();
        posterListElement.setAdapter(posterListAdapter);
        posterListLayoutManager = new LinearLayoutManager(getActivity());
        posterListElement.setLayoutManager(posterListLayoutManager);

        if(listKind.equalsIgnoreCase("Movies")){
            movieListViewModel = new ViewModelProvider(MainActivity.getInstance()).get(MovieListViewModel.class);
            movieListViewModel.Data.observe(getViewLifecycleOwner(), new Observer<List<Movie>>() {
                @Override
                public void onChanged(List<Movie> movieList) {
                    posterListAdapter.setData(movieList);
                    posterListAdapter.notifyDataSetChanged();
                }
            });
            movieListViewModel.load(shelfId);
        }
        else if(listKind.equalsIgnoreCase("Shows")){
            showListViewModel = new ViewModelProvider(MainActivity.getInstance()).get(ShowListViewModel.class);
            showListViewModel.Data.observe(getViewLifecycleOwner(), new Observer<List<Show>>() {
                @Override
                public void onChanged(List<Show> showList) {
                    posterListAdapter.setData(showList);
                    posterListAdapter.notifyDataSetChanged();
                }
            });
            showListViewModel.load(shelfId);
        }
        else if(listKind.equalsIgnoreCase("Seasons")){
            seasonListViewModel = new ViewModelProvider(MainActivity.getInstance()).get(SeasonListViewModel.class);
            seasonListViewModel.Data.observe(getViewLifecycleOwner(), new Observer<List<Season>>() {
                @Override
                public void onChanged(List<Season> seasonList) {
                    posterListAdapter.setData(seasonList);
                    posterListAdapter.notifyDataSetChanged();
                }
            });
            seasonListViewModel.load(showId);
        }
        else if(listKind.equalsIgnoreCase("Episodes")){
            episodeListViewModel = new ViewModelProvider(MainActivity.getInstance()).get(EpisodeListViewModel.class);
            episodeListViewModel.Data.observe(getViewLifecycleOwner(), new Observer<List<Episode>>() {
                @Override
                public void onChanged(List<Episode> episodeList) {
                    posterListAdapter.setData(episodeList);
                    posterListAdapter.notifyDataSetChanged();
                }
            });
            episodeListViewModel.load(seasonId);
        }
    }
}
