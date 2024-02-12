package com.simplepathstudios.snowstream.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.MainActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.adapter.ShowListAdapter;
import com.simplepathstudios.snowstream.adapter.UserListAdapter;
import com.simplepathstudios.snowstream.api.model.Show;
import com.simplepathstudios.snowstream.viewmodel.SettingsViewModel;
import com.simplepathstudios.snowstream.viewmodel.ShowListViewModel;
import com.simplepathstudios.snowstream.viewmodel.UserListViewModel;

import java.util.List;

public class ShowShelfFragment extends Fragment {
    private ShowListViewModel showListViewModel;
    private RecyclerView showListElement;
    private LinearLayoutManager showListLayoutManager;
    private ShowListAdapter showListAdapter;
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.show_shelf_fragment, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        int shelfId = getArguments().getInt("ShelfId");
        String shelfName = getArguments().getString("ShelfName");
        
        showListElement = view.findViewById(R.id.show_list);
        showListAdapter = new ShowListAdapter();
        showListElement.setAdapter(showListAdapter);
        showListLayoutManager = new LinearLayoutManager(getActivity());
        showListElement.setLayoutManager(showListLayoutManager);
        showListViewModel = new ViewModelProvider(MainActivity.getInstance()).get(ShowListViewModel.class);
        showListViewModel.Data.observe(getViewLifecycleOwner(), new Observer<List<Show>>() {
            @Override
            public void onChanged(List<Show> showList) {
                showListAdapter.setData(showList);
                showListAdapter.notifyDataSetChanged();
            }
        });
        showListViewModel.load(shelfId);
    }
}
